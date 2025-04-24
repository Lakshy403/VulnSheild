import scrapy
from scrapy.crawler import CrawlerRunner
from twisted.internet import reactor
from twisted.internet.task import deferLater
from urllib.parse import urljoin, urlparse
from multiprocessing import Manager
from crochet import setup, wait_for

setup()  # Initialize Crochet once at import time


class EndpointSpider(scrapy.Spider):
    name = "endpoint_spider"

    def __init__(self, base_url, results):
        self.start_urls = [base_url]
        self.base_url = base_url
        self.allowed_domain = urlparse(base_url).netloc
        self.results = results

    def parse(self, response):
        for href in response.css('a::attr(href)').getall():
            full_url = urljoin(response.url, href)
            if urlparse(full_url).netloc == self.allowed_domain:
                if full_url not in self.results:
                    self.results.append(full_url)
                    yield scrapy.Request(full_url, callback=self.parse)

        forms = response.css("form")
        if forms:
            self.results.append(response.url)


@wait_for(timeout=30.0)
def crawl_website(base_url):
    manager = Manager()
    shared_results = manager.list()

    runner = CrawlerRunner(settings={"LOG_ENABLED": False})
    d = runner.crawl(EndpointSpider, base_url=base_url, results=shared_results)

    def return_results(_):
        return list(shared_results)

    d.addCallback(return_results)
    return d
